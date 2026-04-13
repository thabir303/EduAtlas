from rest_framework import permissions, viewsets

from .models import Category, Subcategory, Subject
from .serializers import (
	CategorySerializer,
	SubcategorySerializer,
	SubjectDetailSerializer,
	SubjectListSerializer,
)


class CategoryViewSet(viewsets.ModelViewSet):
	queryset = Category.objects.prefetch_related("subcategories__subjects").all()
	serializer_class = CategorySerializer
	lookup_field = "slug"

	def get_permissions(self):
		if self.action in ["list", "retrieve"]:
			return [permissions.AllowAny()]
		return [permissions.IsAdminUser()]


class SubcategoryViewSet(viewsets.ModelViewSet):
	queryset = Subcategory.objects.select_related("category").prefetch_related("subjects").all()
	serializer_class = SubcategorySerializer
	lookup_field = "slug"

	def get_permissions(self):
		if self.action in ["list", "retrieve"]:
			return [permissions.AllowAny()]
		return [permissions.IsAdminUser()]


class SubjectViewSet(viewsets.ModelViewSet):
	queryset = Subject.objects.select_related("subcategory__category").all()
	lookup_field = "slug"

	def get_serializer_class(self):
		if self.action == "retrieve":
			return SubjectDetailSerializer
		return SubjectListSerializer

	def get_permissions(self):
		if self.action in ["list", "retrieve"]:
			return [permissions.AllowAny()]
		return [permissions.IsAdminUser()]
