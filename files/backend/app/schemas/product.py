from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ProductImageOut(BaseModel):
    url: str
    alt_text: Optional[str] = None
    sort_order: int = 0

    model_config = {"from_attributes": True}


class CategoryOut(BaseModel):
    id: str
    slug: str
    name_en: str
    name_th: Optional[str] = None

    model_config = {"from_attributes": True}


class ProductResponse(BaseModel):
    id: str
    sku: str
    slug: str
    name_en: str
    name_th: Optional[str] = None
    description_en: Optional[str] = None
    description_th: Optional[str] = None
    fda_registration_number: Optional[str] = None  # Thai FDA อย. number
    price: float
    compare_price: Optional[float] = None
    stock_qty: int
    is_featured: bool
    is_active: bool
    category: Optional[CategoryOut] = None
    images: List[ProductImageOut] = []
    created_at: datetime

    model_config = {"from_attributes": True}


class ProductCreate(BaseModel):
    sku: str
    slug: str
    name_en: str
    name_th: Optional[str] = None
    description_en: Optional[str] = None
    description_th: Optional[str] = None
    fda_registration_number: Optional[str] = None
    price: float
    compare_price: Optional[float] = None
    stock_qty: int = 0
    category_id: Optional[str] = None
    is_featured: bool = False


class ProductUpdate(BaseModel):
    name_en: Optional[str] = None
    name_th: Optional[str] = None
    description_en: Optional[str] = None
    description_th: Optional[str] = None
    fda_registration_number: Optional[str] = None
    price: Optional[float] = None
    compare_price: Optional[float] = None
    stock_qty: Optional[int] = None
    category_id: Optional[str] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None
