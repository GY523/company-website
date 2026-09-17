(() => {
  const triggers = [...document.querySelectorAll('.service-trigger')];
  const groupTriggers = [...document.querySelectorAll('.solution-group-trigger')];
  if (!triggers.length) return;

  const panelFor = trigger => document.getElementById(trigger.getAttribute('aria-controls'));
  const triggerFor = panel => triggers.find(trigger => trigger.getAttribute('aria-controls') === panel.id);
  const groupPanels = trigger => trigger.getAttribute('aria-controls').split(/\s+/).map(id => document.getElementById(id));

  const syncGroups = () => {
    groupTriggers.forEach(trigger => {
      trigger.setAttribute('aria-expanded', String(groupPanels(trigger).every(panel => !panel.hidden)));
    });
  };

  const close = trigger => {
    trigger.setAttribute('aria-expanded', 'false');
    panelFor(trigger).hidden = true;
  };

  const open = trigger => {
    trigger.setAttribute('aria-expanded', 'true');
    panelFor(trigger).hidden = false;
  };

  const closeAll = () => {
    triggers.forEach(close);
    syncGroups();
  };

  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const wasOpen = trigger.getAttribute('aria-expanded') === 'true';
      closeAll();
      if (wasOpen) {
        history.pushState(null, '', location.pathname);
      } else {
        open(trigger);
        history.pushState(null, '', `#${panelFor(trigger).id}`);
      }
      syncGroups();
    });
  });

  groupTriggers.forEach(groupTrigger => {
    groupTrigger.addEventListener('click', () => {
      const panels = groupPanels(groupTrigger);
      const shouldOpen = !panels.every(panel => !panel.hidden);
      closeAll();
      if (shouldOpen) {
        panels.forEach(panel => open(triggerFor(panel)));
        history.pushState(null, '', `#${groupTrigger.closest('.solution-group').id}`);
      } else {
        history.pushState(null, '', location.pathname);
      }
      syncGroups();
    });
  });

  const openFromHash = () => {
    closeAll();
    if (!location.hash) return;

    const group = document.querySelector(location.hash);
    if (group?.classList.contains('solution-group')) {
      const groupTrigger = group.querySelector('.solution-group-trigger');
      groupPanels(groupTrigger).forEach(panel => open(triggerFor(panel)));
      syncGroups();
      return;
    }

    const trigger = triggers.find(item => `#${item.getAttribute('aria-controls')}` === location.hash);
    if (trigger) open(trigger);
    syncGroups();
  };

  window.addEventListener('hashchange', openFromHash);
  window.addEventListener('popstate', openFromHash);
  openFromHash();
})();
