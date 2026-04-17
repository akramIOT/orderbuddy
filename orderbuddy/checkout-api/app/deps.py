from typing import Annotated

from fastapi import Depends, Request

from app.services.checkout_service import CheckoutService


def get_checkout_service(request: Request) -> CheckoutService:
    return request.app.state.checkout_service


CheckoutSvc = Annotated[CheckoutService, Depends(get_checkout_service)]
