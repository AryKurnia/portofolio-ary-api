// Sementara membaca tabel social_media (hanya yang aktif). Diganti tabel social_links
// dengan sort_order & label di M5 bagian 3 — bentuk respons publik tetap sama.
class ListPublicSocialLinks {
  constructor(socialMediaRepository) {
    this._socialMediaRepository = socialMediaRepository;
  }

  async execute() {
    const socialMedia = await this._socialMediaRepository.findAll();
    return socialMedia.filter((item) => item.enabled);
  }
}

module.exports = ListPublicSocialLinks;
