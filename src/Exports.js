function modules() {
  return {
    auths: auths_(),
    collections: collections_(),
    downloaders: downloaders_(),
    updaters: updaters_(),
    views: views_(),

    orchestrators: {
      manageBacUpdater: manageBacUpdater_,
      openApplyUpdater: openApplyUpdater_,
    },

    // keep these at this level for backward compatibility
    manageBacUpdater: manageBacUpdater_,
    openApplyUpdater: openApplyUpdater_,
  };
}
