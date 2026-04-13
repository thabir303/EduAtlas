import uuid

from django.db import models


class ContentBlock(models.Model):
	"""Article body for a subject stored as BodyNode JSON."""

	subject = models.OneToOneField(
		"subjects.Subject",
		on_delete=models.CASCADE,
		related_name="content_block",
	)
	title = models.CharField(max_length=255)
	body = models.JSONField(default=list, help_text="List of BodyNode paragraph objects")
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return f"Content: {self.subject.title}"


class ExpandableSection(models.Model):
	"""Right-side expandable supporting content blocks."""

	content_block = models.ForeignKey(
		ContentBlock,
		on_delete=models.CASCADE,
		related_name="expandable_sections",
	)
	title = models.CharField(max_length=255)
	body = models.TextField(help_text="Plain text or simple HTML for section content")
	order = models.PositiveIntegerField(default=0, help_text="Display order (lower = first)")
	is_default_open = models.BooleanField(default=False)

	class Meta:
		ordering = ["order"]

	def __str__(self):
		return f"{self.content_block.subject.title} - {self.title}"


class InlineAnnotation(models.Model):
	"""Binds a highlighted term to a media asset."""

	content_block = models.ForeignKey(
		ContentBlock,
		on_delete=models.CASCADE,
		related_name="annotations",
	)
	term = models.CharField(max_length=255, help_text="The visible highlighted text")
	media_asset = models.ForeignKey(
		"media_assets.MediaAsset",
		on_delete=models.CASCADE,
		related_name="annotations",
	)
	annotation_id = models.UUIDField(
		default=uuid.uuid4,
		unique=True,
		editable=False,
		help_text="UUID embedded in body JSON to link annotated spans to this record",
	)

	def __str__(self):
		return f'"{self.term}" -> {self.media_asset}'
