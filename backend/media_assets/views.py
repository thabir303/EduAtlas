from rest_framework import permissions, viewsets

from .models import MediaAsset
from .serializers import MediaAssetSerializer


class MediaAssetViewSet(viewsets.ModelViewSet):
	queryset = MediaAsset.objects.all()
	serializer_class = MediaAssetSerializer

	def get_permissions(self):
		if self.action in ["list", "retrieve"]:
			return [permissions.AllowAny()]
		return [permissions.IsAdminUser()]
