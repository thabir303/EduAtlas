from django.core.exceptions import ValidationError
from django.db import models


class MediaAsset(models.Model):
	MEDIA_TYPES = [
		("text", "Text"),
		("image", "Image"),
		("audio", "Audio"),
		("video", "Video"),
		("youtube", "YouTube"),
	]

	title = models.CharField(max_length=255)
	media_type = models.CharField(max_length=20, choices=MEDIA_TYPES)
	text_content = models.TextField(blank=True)
	file = models.FileField(upload_to="media_assets/%Y/%m/", blank=True, null=True)
	youtube_url = models.URLField(blank=True)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ["-created_at"]

	def __str__(self):
		return f"[{self.media_type.upper()}] {self.title}"

	def clean(self):
		if self.media_type == "youtube" and not self.youtube_url:
			raise ValidationError("YouTube URL is required for youtube type.")
		if self.media_type in ["image", "audio", "video"] and not self.file:
			raise ValidationError(f"File is required for {self.media_type} type.")
		if self.media_type == "text" and not self.text_content:
			raise ValidationError("Text content is required for text type.")
