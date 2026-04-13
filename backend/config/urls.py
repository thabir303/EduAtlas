from content.views import (
    AnnotationByUUIDView,
    ContentBlockViewSet,
    ExpandableSectionViewSet,
    InlineAnnotationViewSet,
)
from media_assets.views import MediaAssetViewSet
from subjects.views import CategoryViewSet, SubcategoryViewSet, SubjectViewSet

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='category')
router.register('subcategories', SubcategoryViewSet, basename='subcategory')
router.register('subjects', SubjectViewSet, basename='subject')
router.register('content', ContentBlockViewSet, basename='content')
router.register('expandable-sections', ExpandableSectionViewSet, basename='expandable-section')
router.register('inline-annotations', InlineAnnotationViewSet, basename='inline-annotation')
router.register('media-assets', MediaAssetViewSet, basename='media-asset')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path(
        'api/annotations/<uuid:annotation_id>/',
        AnnotationByUUIDView.as_view(),
        name='annotation-by-uuid',
    ),
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
