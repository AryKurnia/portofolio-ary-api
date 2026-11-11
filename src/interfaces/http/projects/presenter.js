// URL gambar (dan varian ukurannya) ditambahkan bersama fitur upload di M4.
const toProjectResponse = (project) => ({
  id: project.id,
  title: project.title,
  description: project.description,
  image_id: project.imageMediaId,
  link_url: project.linkUrl,
  show_button: project.showButton,
  is_published: project.isPublished,
  sort_order: project.sortOrder,
  created_at: project.createdAt,
  updated_at: project.updatedAt,
});

module.exports = { toProjectResponse };
