from rest_framework import permissions, viewsets
from rest_framework.response import Response

from config.pagination import StandardResultsSetPagination

from .models import MediaAsset
from .serializers import MediaAssetSerializer


class MediaAssetViewSet(viewsets.ModelViewSet):
	queryset = MediaAsset.objects.order_by("-updated_at", "-created_at")
	serializer_class = MediaAssetSerializer
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
