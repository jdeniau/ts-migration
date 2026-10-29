const ITEM_CLASS = 'File';

function copyToClip(str) {
  function listener(e) {
    e.clipboardData?.setData('text/html', str);
    e.clipboardData?.setData('text/plain', str);
    e.preventDefault();
  }

  document.addEventListener('copy', listener);
  const success = document.execCommand('copy');
  document.removeEventListener('copy', listener);

  return success;
}

let toastTimeout;

function showToast(message) {
  let toast = document.querySelector('.Toast');

  if (!toast) {
    toast = document.createElement('div');
    toast.classList.add('Toast');
    toast.setAttribute('role', 'status');
    document.body.appendChild(toast);
  }

  toast.innerText = message;
  toast.classList.add('Toast--visible');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(function () {
    toast.classList.remove('Toast--visible');
  }, 2000);
}

let currentHover;

document.addEventListener(
  'mouseover',
  function (event) {
    const target = event.target;

    if (!target.classList.contains(ITEM_CLASS)) {
      return;
    }

    const tooltip = document.createElement('div');
    tooltip.classList.add('Tooltip');
    tooltip.style.top =
      target.getBoundingClientRect().top + window.scrollY + 'px';
    tooltip.style.left =
      target.getBoundingClientRect().left + window.scrollX + 'px';

    const tooltipContent = document.createElement('div');
    tooltipContent.classList.add('TooltipContent');
    tooltipContent.innerText = target.getAttribute('data-tooltip');
    tooltipContent.style.left = '-15px';
    tooltipContent.style.right = 'auto';

    tooltip.appendChild(tooltipContent);
    document.body.appendChild(tooltip);

    currentHover = target;
  },
  false
);

document.addEventListener('mouseout', function (event) {
  const target = event.target;

  if (!target.classList.contains(ITEM_CLASS)) {
    return;
  }

  const tooltip = document.querySelector('.Tooltip');
  tooltip.remove();
  delete currentHover;
});

document.addEventListener('click', function (event) {
  const target = event.target;

  if (!target.classList.contains(ITEM_CLASS)) {
    return;
  }

  event.preventDefault();

  const path = target.getAttribute('data-copy');

  if (copyToClip(path)) {
    showToast(`"${path}" copied to clipboard`);
  } else {
    showToast(`Unable to copy "${path}" to clipboard`);
  }
});

function selectTab(tab) {
  document.querySelectorAll('.Tab').forEach((otherTab) => {
    const isActive = otherTab === tab;

    otherTab.classList.toggle('Tab--active', isActive);
    otherTab.setAttribute('aria-selected', isActive);
    document.getElementById(otherTab.getAttribute('aria-controls')).hidden =
      !isActive;
  });

  localStorage.setItem('activeTab', tab.getAttribute('data-tab'));
}

document.addEventListener('click', function (event) {
  const tab = event.target.closest('.Tab');

  if (tab) {
    selectTab(tab);
  }
});

// restore the last selected tab
const activeTab = Array.from(document.querySelectorAll('.Tab')).find(
  (tab) => tab.getAttribute('data-tab') === localStorage.getItem('activeTab')
);

if (activeTab) {
  selectTab(activeTab);
}

const searchInput = document.querySelector('.SearchInput');
const searchCount = document.querySelector('.SearchCount');

// highlight the files whose path contains the search
searchInput.addEventListener('input', function () {
  const search = searchInput.value.trim().toLowerCase();
  let nbMatches = 0;

  document.querySelectorAll('.File').forEach((file) => {
    const isMatch =
      search !== '' &&
      file.getAttribute('data-copy').toLowerCase().includes(search);

    file.classList.toggle('File--match', isMatch);

    if (isMatch) {
      nbMatches++;
    }
  });

  searchCount.innerText =
    search === ''
      ? ''
      : `${nbMatches} matching file${nbMatches > 1 ? 's' : ''}`;
});

window.tagIgnoredFiles = function tagIgnoredFiles() {
  const files = document.querySelectorAll('.File');
  const pushedLastFiles = getPushedLastFiles();

  files.forEach((file) => {
    const path = file.getAttribute('data-copy');

    if (pushedLastFiles.has(path)) {
      file.classList.add('File--ignored');
    } else {
      file.classList.remove('File--ignored');
    }
  });
};

window.tagIgnoredFiles();

// if we press the 'i' key while hovering over a file, we push it to the last files
document.addEventListener('keydown', function (event) {
  // do not ignore a file when typing "i" in the search input
  if (event.key !== 'i' || event.target instanceof HTMLInputElement) {
    return;
  }

  const target = currentHover;

  if (!target || !target.classList.contains(ITEM_CLASS)) {
    return;
  }

  const path = target.getAttribute('data-copy');
  toggleIgnoredFile(path);

  window.tagIgnoredFiles();
});

function getPushedLastFiles() {
  const pushedLastFilesAsString = localStorage.getItem('pushedLastFiles');
  const pushedLastFiles = new Set(
    pushedLastFilesAsString ? JSON.parse(pushedLastFilesAsString) : []
  );

  return pushedLastFiles;
}

function toggleIgnoredFile(path) {
  const pushedLastFiles = getPushedLastFiles();

  if (pushedLastFiles.has(path)) {
    pushedLastFiles.delete(path);
  } else {
    pushedLastFiles.add(path);
  }

  localStorage.setItem('pushedLastFiles', JSON.stringify([...pushedLastFiles]));
}
