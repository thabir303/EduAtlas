from django.db import models
from django.utils.text import slugify


class Category(models.Model):
	"""Top-level grouping. Example: Science, History."""

	name = models.CharField(max_length=255)
	slug = models.SlugField(unique=True, blank=True)
	description = models.TextField(blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		verbose_name_plural = "Categories"
		ordering = ["-updated_at", "-created_at"]

	def save(self, *args, **kwargs):
		if not self.slug:
			self.slug = slugify(self.name)
		super().save(*args, **kwargs)

	def __str__(self):
		return self.name


class Subcategory(models.Model):
	"""Mid-level grouping under category."""

	category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="subcategories")
	name = models.CharField(max_length=255)
	slug = models.SlugField(unique=True, blank=True)
	description = models.TextField(blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		verbose_name_plural = "Subcategories"
		ordering = ["-updated_at", "-created_at"]

	def save(self, *args, **kwargs):
		if not self.slug:
			self.slug = slugify(self.name)
		super().save(*args, **kwargs)

	def __str__(self):
		return f"{self.category.name} -> {self.name}"


class Subject(models.Model):
	"""Leaf-level item with full article content."""

	subcategory = models.ForeignKey(Subcategory, on_delete=models.CASCADE, related_name="subjects")
	title = models.CharField(max_length=255)
	slug = models.SlugField(unique=True, blank=True)
	description = models.TextField(blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ["-updated_at", "-created_at"]

	def save(self, *args, **kwargs):
		is_new = self._state.adding
		if not self.slug:
			self.slug = slugify(self.title)
		super().save(*args, **kwargs)

		if is_new:
			from content.models import ContentBlock

			ContentBlock.objects.get_or_create(
				subject=self,
				defaults={
					"title": self.title,
					"body": [],
				},
			)

	def __str__(self):
		return self.title
