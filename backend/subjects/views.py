from django.db.models import Prefetch
from rest_framework import permissions, viewsets
from rest_framework.response import Response

from config.pagination import StandardResultsSetPagination

from .models import Category, Subcategory, Subject
from .serializers import (
	CategorySerializer,
	SubcategorySerializer,
	SubjectDetailSerializer,
	SubjectListSerializer,
)


class CategoryViewSet(viewsets.ModelViewSet):
	queryset = Category.objects.prefetch_related(
		Prefetch(
			"subcategories",
			queryset=Subcategory.objects.order_by("-updated_at", "-created_at").prefetch_related(
				Prefetch(
					"subjects",
					queryset=Subject.objects.select_related("subcategory__category").order_by("-updated_at", "-created_at"),
				),
			),
		),
	).order_by("-updated_at", "-created_at")
	serializer_class = CategorySerializer
	lookup_field = "slug"
	pagination_class = StandardResultsSetPagination

	def list(self, request, *args, **kwargs):
		if request.query_params.get("all") == "1":
			queryset = self.filter_queryset(self.get_queryset())
			serializer = self.get_serializer(queryset, many=True)
			return Response(serializer.data)
		return super().list(request, *args, **kwargs)

	def get_permissions(self):
		if self.action in ["list", "retrieve"]:
			return [permissions.AllowAny()]
		return [permissions.IsAdminUser()]


class SubcategoryViewSet(viewsets.ModelViewSet):
	queryset = Subcategory.objects.select_related("category").prefetch_related("subjects").order_by("-updated_at", "-created_at")
	serializer_class = SubcategorySerializer
	lookup_field = "slug"

	def get_permissions(self):
		if self.action in ["list", "retrieve"]:
			return [permissions.AllowAny()]
		return [permissions.IsAdminUser()]


class SubjectViewSet(viewsets.ModelViewSet):
	queryset = Subject.objects.select_related("subcategory__category").order_by("-updated_at", "-created_at")
	lookup_field = "slug"
	pagination_class = StandardResultsSetPagination
	filterset_fields = {
		"subcategory": ["exact"],
		"subcategory__slug": ["exact"],
		"subcategory__category__slug": ["exact"],
	}

	def list(self, request, *args, **kwargs):
		if request.query_params.get("all") == "1":
			queryset = self.filter_queryset(self.get_queryset())
			serializer = self.get_serializer(queryset, many=True)
			return Response(serializer.data)
		return super().list(request, *args, **kwargs)

	def get_serializer_class(self):
		if self.action == "retrieve":
			return SubjectDetailSerializer
		return SubjectListSerializer

	def get_permissions(self):
		if self.action in ["list", "retrieve"]:
			return [permissions.AllowAny()]
		return [permissions.IsAdminUser()]
