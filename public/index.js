const ITEM_CLASS = 'File';

function copyToClip(str) {
  function listener(e) {
    e.clipboardData?.setData('text/html', str);
    e.clipboardData?.setData('text/plain', str);
    e.preventDefault();
  }

  document.addEventListener('copy', listener);
  document.execCommand('copy');
  document.removeEventListener('copy', listener);
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

  copyToClip(target.getAttribute('data-copy'));
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
  if (event.key !== 'i') {
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
