"""
Billing routes for subscription management and Stripe integration
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from typing import Optional
import logging
import stripe
import os
from services.supabase_client import get_supabase_client
from services.auth_service import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

@router.get("/plans")
async def get_subscription_plans():
    """Get available subscription plans"""
    return {
        "plans": [
            {
                "id": "free",
                "name": "Free",
                "price": 0,
                "currency": "usd",
                "interval": "month",
                "features": [
                    "Basic subtitle generation",
                    "30 energy per day",
                    "Font customization",
                    "Color customization",
                    "5-minute video limit",
                    "Watermark on exports"
                ],
                "limits": {
                    "video_length": 300,  # 5 minutes in seconds
                    "video_size": 200 * 1024 * 1024,  # 200MB
                    "daily_energy": 30
                }
            },
            {
                "id": "pro",
                "name": "Pro",
                "price": 1000,  # $10.00 in cents
                "currency": "usd",
                "interval": "month",
                "features": [
                    "Advanced subtitle generation",
                    "300 energy per day",
                    "Full font library",
                    "Advanced color options",
                    "Watermark-free exports",
                    "Basic positioning",
                    "30-minute video limit"
                ],
                "limits": {
                    "video_length": 1800,  # 30 minutes in seconds
                    "video_size": 500 * 1024 * 1024,  # 500MB
                    "daily_energy": 300
                }
            },
            {
                "id": "team",
                "name": "Team",
                "price": 2500,  # $25.00 in cents
                "currency": "usd",
                "interval": "month",
                "features": [
                    "Premium subtitle generation",
                    "Unlimited energy",
                    "Full font library + custom uploads",
                    "Advanced color options - gradients",
                    "Watermark-free exports",
                    "Free positioning anywhere",
                    "Advanced shadow & animation effects",
                    "Unlimited video length"
                ],
                "limits": {
                    "video_length": float('inf'),
                    "video_size": 1024 * 1024 * 1024,  # 1GB
                    "daily_energy": float('inf')
                }
            }
        ],
        "message": "Subscription plans retrieved successfully"
    }

@router.post("/create-checkout-session")
async def create_checkout_session(
    price_id: str,
    user: dict = Depends(get_current_user)
):
    """Create Stripe checkout session for subscription"""
    try:
        supabase = get_supabase_client()
        
        # Get or create Stripe customer
        customer_id = await _get_or_create_stripe_customer(user)
        
        # Create checkout session
        checkout_session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=['card'],
            line_items=[
                {
                    'price': price_id,
                    'quantity': 1,
                }
            ],
            mode='subscription',
            success_url=f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/dashboard?success=true",
            cancel_url=f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/pricing?canceled=true",
            metadata={
                'user_id': user['id'],
                'user_email': user['email']
            }
        )
        
        return {
            "checkout_url": checkout_session.url,
            "session_id": checkout_session.id,
            "message": "Checkout session created successfully"
        }
        
    except Exception as e:
        logger.error(f"Failed to create checkout session: {e}")
        raise HTTPException(status_code=500, detail="Failed to create checkout session")

@router.post("/create-portal-session")
async def create_portal_session(
    user: dict = Depends(get_current_user)
):
    """Create Stripe customer portal session"""
    try:
        supabase = get_supabase_client()
        
        # Get Stripe customer ID
        customer_id = await _get_or_create_stripe_customer(user)
        
        # Create portal session
        portal_session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/dashboard"
        )
        
        return {
            "portal_url": portal_session.url,
            "message": "Portal session created successfully"
        }
        
    except Exception as e:
        logger.error(f"Failed to create portal session: {e}")
        raise HTTPException(status_code=500, detail="Failed to create portal session")

@router.get("/subscription")
async def get_subscription(
    user: dict = Depends(get_current_user)
):
    """Get user's current subscription"""
    try:
        supabase = get_supabase_client()
        
        # Get billing information
        result = supabase.table("billing")\
            .select("*")\
            .eq("user_id", user["id"])\
            .eq("status", "active")\
            .execute()
        
        if not result.data:
            return {
                "subscription": None,
                "plan": "free",
                "message": "No active subscription found"
            }
        
        billing = result.data[0]
        
        # Get Stripe subscription details
        try:
            stripe_subscription = stripe.Subscription.retrieve(billing["stripe_subscription_id"])
            
            return {
                "subscription": {
                    "id": billing["id"],
                    "plan": billing["plan"],
                    "status": billing["status"],
                    "current_period_start": billing["current_period_start"],
                    "current_period_end": billing["current_period_end"],
                    "stripe_subscription": stripe_subscription
                },
                "message": "Subscription retrieved successfully"
            }
        except stripe.error.StripeError:
            return {
                "subscription": billing,
                "message": "Subscription retrieved (Stripe details unavailable)"
            }
        
    except Exception as e:
        logger.error(f"Failed to get subscription: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve subscription")

@router.post("/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks"""
    try:
        payload = await request.body()
        sig_header = request.headers.get('stripe-signature')
        endpoint_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
        
        # Verify webhook signature
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, endpoint_secret
            )
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid payload")
        except stripe.error.SignatureVerificationError:
            raise HTTPException(status_code=400, detail="Invalid signature")
        
        # Handle the event
        if event['type'] == 'checkout.session.completed':
            await _handle_checkout_completed(event['data']['object'])
        elif event['type'] == 'customer.subscription.updated':
            await _handle_subscription_updated(event['data']['object'])
        elif event['type'] == 'customer.subscription.deleted':
            await _handle_subscription_deleted(event['data']['object'])
        
        return {"status": "success"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Webhook handling failed: {e}")
        raise HTTPException(status_code=500, detail="Webhook handling failed")

async def _get_or_create_stripe_customer(user: dict) -> str:
    """Get or create Stripe customer for user"""
    try:
        supabase = get_supabase_client()
        
        # Check if user already has a Stripe customer ID
        result = supabase.table("users")\
            .select("stripe_customer_id")\
            .eq("id", user["id"])\
            .execute()
        
        if result.data and result.data[0].get("stripe_customer_id"):
            return result.data[0]["stripe_customer_id"]
        
        # Create new Stripe customer
        customer = stripe.Customer.create(
            email=user["email"],
            name=user.get("full_name"),
            metadata={
                'user_id': user['id']
            }
        )
        
        # Update user with Stripe customer ID
        supabase.table("users")\
            .update({"stripe_customer_id": customer.id})\
            .eq("id", user["id"])\
            .execute()
        
        return customer.id
        
    except Exception as e:
        logger.error(f"Failed to get/create Stripe customer: {e}")
        raise

async def _handle_checkout_completed(session):
    """Handle successful checkout completion"""
    try:
        supabase = get_supabase_client()
        user_id = session['metadata']['user_id']
        
        # Get subscription details
        subscription = stripe.Subscription.retrieve(session['subscription'])
        
        # Update user subscription tier
        plan_mapping = {
            'price_free': 'free',
            'price_pro': 'pro',
            'price_team': 'team'
        }
        
        plan = plan_mapping.get(subscription['items']['data'][0]['price']['id'], 'free')
        
        # Update user
        supabase.table("users")\
            .update({"subscription_tier": plan})\
            .eq("id", user_id)\
            .execute()
        
        # Create billing record
        supabase.table("billing").insert({
            "user_id": user_id,
            "stripe_subscription_id": subscription['id'],
            "plan": plan,
            "status": "active",
            "current_period_start": subscription['current_period_start'],
            "current_period_end": subscription['current_period_end']
        }).execute()
        
        logger.info(f"Subscription activated for user {user_id}")
        
    except Exception as e:
        logger.error(f"Failed to handle checkout completion: {e}")

async def _handle_subscription_updated(subscription):
    """Handle subscription updates"""
    try:
        supabase = get_supabase_client()
        
        # Update billing record
        supabase.table("billing")\
            .update({
                "status": subscription['status'],
                "current_period_start": subscription['current_period_start'],
                "current_period_end": subscription['current_period_end']
            })\
            .eq("stripe_subscription_id", subscription['id'])\
            .execute()
        
        logger.info(f"Subscription updated: {subscription['id']}")
        
    except Exception as e:
        logger.error(f"Failed to handle subscription update: {e}")

async def _handle_subscription_deleted(subscription):
    """Handle subscription cancellation"""
    try:
        supabase = get_supabase_client()
        
        # Update billing record
        supabase.table("billing")\
            .update({"status": "canceled"})\
            .eq("stripe_subscription_id", subscription['id'])\
            .execute()
        
        # Get user ID and downgrade to free
        billing = supabase.table("billing")\
            .select("user_id")\
            .eq("stripe_subscription_id", subscription['id'])\
            .execute()
        
        if billing.data:
            supabase.table("users")\
                .update({"subscription_tier": "free"})\
                .eq("id", billing.data[0]["user_id"])\
                .execute()
        
        logger.info(f"Subscription canceled: {subscription['id']}")
        
    except Exception as e:
        logger.error(f"Failed to handle subscription deletion: {e}")







