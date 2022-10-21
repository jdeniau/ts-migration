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

document.addEventListener(
  'mouseover',
  function (event) {
    const target = event.target;

    if (!target.classList.contains('Test')) {
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
  },
  false
);

document.addEventListener('mouseout', function (event) {
  const target = event.target;

  if (!target.classList.contains('Test')) {
    return;
  }

  const tooltip = document.querySelector('.Tooltip');
  tooltip.remove();
});

document.addEventListener('click', function (event) {
  const target = event.target;

  if (!target.classList.contains('Test')) {
    return;
  }

  copyToClip(target.getAttribute('data-tooltip'));
});
