import { FolderArchive } from 'lucide-react';

export default function GalleryCategories({
  categories = [],
  selectedCategory = 'all',
  onSelectCategory,
  categoryCounts = {},
  onOpenZipModal,
}) {
  const currentCategory = categories.find((cat) => cat.key === selectedCategory) || {
    key: selectedCategory,
    label: 'Photos',
    description: '',
  };

  const currentCount = categoryCounts[selectedCategory] || 0;

  return (
    <>
      {/* Category Navigation Tabs */}
      <div className="gallery-filters-wrapper">
        <div className="gallery-filters" role="tablist" aria-label="Photo categories">
          {categories.map((tab) => {
            const count = categoryCounts[tab.key] || 0;
            // Only show category if count > 0 or if it's the 'all' tab
            if (count === 0 && tab.key !== 'all') return null;

            const isActive = selectedCategory === tab.key;
            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={isActive}
                className={`gallery-filter-btn ${isActive ? 'active' : ''}`}
                onClick={() => onSelectCategory(tab.key)}
              >
                <span className="filter-text">{tab.label}</span>
                <span className="filter-count-badge">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Subheader with Album Info & Download All Button */}
      <div className="gallery-toolbar-container">
        <div className="gallery-toolbar">
          <div className="gallery-category-info">
            <h2 className="gallery-category-title">{currentCategory.label}</h2>
            <p className="gallery-category-desc">
              {currentCategory.description || 'Collection of wedding photographs'}
              <span className="gallery-count-pill">
                {currentCount} {currentCount === 1 ? 'photo' : 'photos'}
              </span>
            </p>
          </div>

          <button
            className="gallery-download-all-btn"
            onClick={onOpenZipModal}
            title={`Download ${currentCategory.label} collection`}
            aria-label={`Download ${currentCategory.label} collection`}
          >
            <FolderArchive size={17} />
            <span>Download Album (ZIP)</span>
          </button>
        </div>
      </div>
    </>
  );
}
