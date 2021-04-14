function module() {
  return {...downloaders_(), ...{
    manageBacUpdater: manageBacUpdater_,
    openApplyUpdater: openApplyUpdater_,
  } };
}

