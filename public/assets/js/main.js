(function(){
  const adminApp = document.querySelector('.admin-app');
  const toggleBtn = document.getElementById('toggleBtn');
  const sidebar = document.getElementById('sidebar');

  // Toggle collapsed / expanded sidebar for wide screens
  toggleBtn.addEventListener('click', function(){
    if(window.innerWidth >= 992){
      // On wide screens hide the sidebar entirely (toggle)
      const hidden = adminApp.classList.toggle('sidebar-hidden');
      try{ localStorage.setItem('cv_admin_sidebar_hidden', hidden ? '1' : '0'); }catch(e){}
      // ensure no horizontal scroll while hidden
      document.body.style.overflowX = hidden ? 'hidden' : '';
      // sync height after transition completes
      setTimeout(syncSidebarHeight, 320);
    } else {
      // On small screens, toggle sidebar open state
      adminApp.classList.toggle('sidebar-open');
      document.body.classList.toggle('admin-overlay');
    }
  });

  // Close sidebar when clicking outside on small screens
  document.addEventListener('click', function(e){
    if(window.innerWidth < 992){
      if(!sidebar.contains(e.target) && !toggleBtn.contains(e.target) && adminApp.classList.contains('sidebar-open')){
        adminApp.classList.remove('sidebar-open');
        document.body.classList.remove('admin-overlay');
      }
    }
  });

  // Close overlay on resize if necessary
  window.addEventListener('resize', function(){
    if(window.innerWidth >= 992){
      adminApp.classList.remove('sidebar-open');
      document.body.classList.remove('admin-overlay');
    }
  });

  // Highlight active link in sidebar
  (function markActive(){
    const links = document.querySelectorAll('.sidebar .nav-link');
    const current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    links.forEach(l => {
      try{
        const href = (l.getAttribute('href') || '').split('/').pop().toLowerCase();
        if(href === current || (href === 'index.html' && (current === '' || current === 'index.html'))){
          l.classList.add('active');
        }
      }catch(e){}
    });
  })();

  // Init Chart.js if canvas present
  function initChart(){
    const canvas = document.getElementById('dashboardChart');
    if(!canvas) return;
    if(typeof Chart === 'undefined') return;
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Nov 1','Nov 5','Nov 10','Nov 15','Nov 20','Nov 24'],
        datasets: [{
          label: 'Active Users',
          data: [820,940,1100,980,1200,1248],
          borderColor: '#0d6efd',
          backgroundColor: 'rgba(13,110,253,0.12)',
          tension: .3,
          fill: true
        },{
          label: 'AI Calls',
          data: [3000,4200,5200,4800,8000,12340],
          borderColor: '#6f42c1',
          backgroundColor: 'rgba(111,66,193,0.08)',
          tension: .3,
          fill: true
        }]
      },
      options: {
        maintainAspectRatio: false,
        plugins: {legend:{position:'top'}},
        scales: {y:{beginAtZero:true}}
      }
    });
  }

  // Try init chart after short delay (Chart.js loaded via CDN)
  setTimeout(function(){
    initChart();
    // sync sidebar after chart is drawn
    setTimeout(syncSidebarHeight, 300);
  }, 250);

  // Initialize DataTables (Simple-DataTables) for tables with class `datatable`
  function initDataTables(){
    try{
      if(typeof simpleDatatables === 'undefined' || !simpleDatatables.DataTable) return;
      const tables = document.querySelectorAll('table.datatable');
      tables.forEach(t => {
        try{
          // prevent double-init
          if(t.dataset.dtInit) return;
          new simpleDatatables.DataTable(t, {
            searchable: true,
            fixedHeight: false,
            perPage: 10,
            labels: {placeholder: 'Search...', perPage: '{select} entries per page'},
            noRowsLabel: 'No records found'
          });
          t.dataset.dtInit = '1';
        }catch(e){/* ignore per-table errors */}
      });
    }catch(e){/* ignore */}
  }

  // Call after a short delay so script assets load and DOM is ready
  setTimeout(initDataTables, 300);

  // Sync sidebar height to match right-side content
  function syncSidebarHeight(){
    try{
      const sidebarEl = document.getElementById('sidebar');
      const contentMain = document.querySelector('.content main') || document.querySelector('.content');
      if(!sidebarEl || !contentMain) return;
      // reset before measuring
      sidebarEl.style.height = 'auto';
      // use scrollHeight to include overflowed content
      const target = Math.max(contentMain.scrollHeight, document.documentElement.clientHeight);
      sidebarEl.style.height = target + 'px';
    }catch(e){/* ignore */}
  }

  // Debounced resize handler
  let __syncTimer = null;
  window.addEventListener('resize', function(){
    clearTimeout(__syncTimer);
    __syncTimer = setTimeout(syncSidebarHeight, 150);
  });

  // Observe main content for changes and resync
  (function observeContent(){
    const main = document.querySelector('.content main');
    if(!main) return;
    const mo = new MutationObserver(function(){
      clearTimeout(__syncTimer);
      __syncTimer = setTimeout(syncSidebarHeight, 80);
    });
    mo.observe(main, {childList:true, subtree:true, attributes:true, characterData:true});
  })();

  // Restore sidebar state from localStorage on load
  (function restoreSidebarState(){
    try{
      const val = localStorage.getItem('cv_admin_sidebar_hidden');
      if(val === '1'){
        adminApp.classList.add('sidebar-hidden');
        // ensure body overflow hidden while sidebar hidden
        document.body.style.overflowX = 'hidden';
      } else {
        adminApp.classList.remove('sidebar-hidden');
        document.body.style.overflowX = '';
      }
    }catch(e){}
    // initial sync
    setTimeout(syncSidebarHeight, 80);
  })();

  // Simple client-side templates add (used in templates page)
  window.addTemplate = function(data){
    // data: {title,desc,img}
    const container = document.getElementById('templatesGrid');
    if(!container) return;
    const col = document.createElement('div');
    col.className = 'col-12 col-sm-6 col-md-4 mb-3';
    col.innerHTML = `
      <div class="template-card">
        <div class="template-thumb"><img src="${data.img}" alt="${data.title}"></div>
        <div class="p-3">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h6 class="mb-1">${data.title}</h6>
              <div class="small muted">${data.desc}</div>
            </div>
            <div class="ms-2">
              <button class="btn btn-sm btn-outline-secondary">Edit</button>
            </div>
          </div>
        </div>
      </div>
    `;
    container.prepend(col);
    // adjust sidebar height after adding a template
    setTimeout(syncSidebarHeight, 80);
  };

  // Hook form submission on templates page
  document.addEventListener('submit', function(e){
    if(!e.target.matches('#templateForm')) return;
    e.preventDefault();
    const fm = e.target;
    const title = fm.querySelector('[name=title]').value || 'Untitled';
    const desc = fm.querySelector('[name=description]').value || '';
    const img = fm.querySelector('[name=image]').value || 'assets/images/template1.svg';
    window.addTemplate({title,desc,img});
    // reset & hide modal if present
    if(typeof bootstrap !== 'undefined'){
      const modalEl = document.getElementById('templateModal');
      if(modalEl){
        const modal = bootstrap.Modal.getInstance(modalEl);
        if(modal) modal.hide();
      }
    }
    fm.reset();
  });

  // Keep body overflow in sync when sidebar-hidden class changes via other means
  const mo = new MutationObserver(function(){
    const hidden = adminApp.classList.contains('sidebar-hidden');
    document.body.style.overflowX = hidden && window.innerWidth >= 992 ? 'hidden' : '';
  });
  mo.observe(adminApp, {attributes:true, attributeFilter:['class']});
})();