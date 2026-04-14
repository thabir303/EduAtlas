from django.core.exceptions import ValidationError
from django.db import models


class MediaAsset(models.Model):
	MAX_TEXT_LENGTH = 500
	MAX_IMAGE_SIZE_BYTES = 1 * 1024 * 1024
	MAX_AUDIO_SIZE_BYTES = 2 * 1024 * 1024
	MAX_VIDEO_SIZE_BYTES = 2 * 1024 * 1024

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
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ["-updated_at", "-created_at"]

	def __str__(self):
		return f"[{self.media_type.upper()}] {self.title}"

	def clean(self):
		if self.media_type == "youtube" and not self.youtube_url:
			raise ValidationError("YouTube URL is required for youtube type.")
		if self.media_type in ["image", "audio", "video"] and not self.file:
			raise ValidationError(f"File is required for {self.media_type} type.")
		if self.media_type == "text" and not self.text_content:
			raise ValidationError("Text content is required for text type.")

		if self.media_type == "text" and len(self.text_content or "") > self.MAX_TEXT_LENGTH:
			raise ValidationError(f"Text content maximum length is {self.MAX_TEXT_LENGTH} characters.")

		if self.media_type == "image" and self.file and self.file.size > self.MAX_IMAGE_SIZE_BYTES:
			raise ValidationError("Image maximum size is 1 MB.")

		if self.media_type == "audio" and self.file and self.file.size > self.MAX_AUDIO_SIZE_BYTES:
			raise ValidationError("Audio maximum size is 2 MB.")

		if self.media_type == "video" and self.file and self.file.size > self.MAX_VIDEO_SIZE_BYTES:
			raise ValidationError("Video maximum size is 2 MB.")
