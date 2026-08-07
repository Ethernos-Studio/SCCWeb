(function() {
  var state = {
    tab: 'contests',
    contests: [],
    problems: [],
    articles: [],
    search: '',
    difficulty: 0
  };

  var difficultyNames = {
    1: '入门',
    2: '普及−',
    3: '普及',
    4: '普及+/提高−',
    5: '提高',
    6: '提高+/省选−',
    7: '省选/NOI−',
    8: 'NOI/NOI+/CTS'
  };

  function init() {
    var hash = window.location.hash.replace(/^#/, '');
    if (hash === 'contests' || hash === 'problems' || hash === 'articles') {
      state.tab = hash;
    }

    Promise.all([
      fetch('data/contests.json').then(function(r) { return r.json(); }),
      fetch('data/problems.json').then(function(r) { return r.json(); }),
      fetch('data/articles.json').then(function(r) { return r.json(); })
    ]).then(function(results) {
      state.contests = results[0];
      state.problems = results[1];
      state.articles = results[2];
      render();

      var articleId = getQueryParam('id');
      if (articleId) {
        state.tab = 'articles';
        window.location.hash = 'articles';
        render();
        loadArticle(articleId);
      }
    }).catch(function(e) {
      document.getElementById('content').innerHTML = '数据加载失败：' + escapeHtml(e.message);
    });
  }

  function getQueryParam(name) {
    var match = new RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match ? decodeURIComponent(match[1].replace(/\+/g, ' ')) : null;
  }

  window.switchTab = function(tab) {
    state.tab = tab;
    history.replaceState(null, '', window.location.pathname + '#' + tab);
    document.getElementById('article-view').style.display = 'none';
    document.getElementById('content').style.display = 'block';
    render();
  };

  window.doSearch = function() {
    state.search = document.getElementById('search-input').value.toLowerCase();
    render();
  };

  window.doFilterDifficulty = function(level) {
    state.difficulty = parseInt(level, 10) || 0;
    render();
  };

  function render() {
    updateNav();
    updateTitle();
    updateFilters();
    updateStats();

    var html = '';
    if (state.tab === 'contests') {
      html = renderContests(filterContests());
    } else if (state.tab === 'problems') {
      html = renderProblems(filterProblems());
    } else if (state.tab === 'articles') {
      html = renderArticles(filterArticles());
    }

    document.getElementById('content').innerHTML = html;
  }

  function updateNav() {
    var links = document.getElementById('nav').getElementsByTagName('a');
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute('href');
      if (href === '#' + state.tab) {
        links[i].className = 'active';
      } else {
        links[i].className = '';
      }
    }
  }

  function updateTitle() {
    var titles = {
      contests: '赛事 / 活动',
      problems: '主题库',
      articles: '文章'
    };
    document.getElementById('section-title').innerHTML = titles[state.tab];
  }

  function updateFilters() {
    var panel = document.getElementById('filter-panel');
    if (state.tab !== 'problems') {
      panel.innerHTML = '';
      return;
    }

    var html = '<h3>难度筛选</h3>';
    html += '<select onchange="doFilterDifficulty(this.value)">';
    html += '<option value="0">全部</option>';
    for (var i = 1; i <= 8; i++) {
      html += '<option value="' + i + '"' + (state.difficulty === i ? ' selected' : '') + '>';
      html += i + ' - ' + escapeHtml(difficultyNames[i]);
      html += '</option>';
    }
    html += '</select>';
    panel.innerHTML = html;
  }

  function updateStats() {
    var s = document.getElementById('stats');
    s.innerHTML = '赛事：' + state.contests.length +
      '<br/>主题：' + state.problems.length +
      '<br/>文章：' + state.articles.length;
  }

  function filterContests() {
    var list = state.contests;
    if (!state.search) return list;
    return list.filter(function(item) {
      return contains(item.name, state.search) ||
             contains(item.invitation_code, state.search);
    });
  }

  function formatTime(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    function pad(n) { return n < 10 ? '0' + n : n; }
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
      ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  function getContestStatus(c) {
    var now = new Date().getTime();
    var start = new Date(c.start_time).getTime();
    var end = new Date(c.end_time).getTime();
    if (isNaN(start) || isNaN(end)) return { label: '未知', className: 'status-unknown' };
    if (now < start) return { label: '未开始', className: 'status-upcoming' };
    if (now > end) return { label: '已结束', className: 'status-ended' };
    return { label: '进行中', className: 'status-ongoing' };
  }

  function renderContests(list) {
    if (!list.length) return '<p class="empty-tip">未找到匹配的赛事。</p>';

    var html = '<table class="data-table"><thead><tr>';
    html += '<th>名称</th><th>开始时间</th><th>结束时间</th><th>状态</th><th>邀请码</th><th>链接</th>';
    html += '</tr></thead><tbody>';

    for (var i = 0; i < list.length; i++) {
      var c = list[i];
      var status = getContestStatus(c);
      html += '<tr>';
      html += '<td>' + escapeHtml(c.name) + '</td>';
      html += '<td>' + escapeHtml(formatTime(c.start_time)) + '</td>';
      html += '<td>' + escapeHtml(formatTime(c.end_time)) + '</td>';
      html += '<td><span class="status ' + status.className + '">' + escapeHtml(status.label) + '</span></td>';
      html += '<td>' + escapeHtml(c.invitation_code || '') + '</td>';
      html += '<td><a href="' + escapeHtml(c.url) + '" target="_blank">进入</a></td>';
      html += '</tr>';
    }

    html += '</tbody></table>';
    return html;
  }

  function filterProblems() {
    var list = state.problems;
    if (state.difficulty > 0) {
      list = list.filter(function(item) {
        return item.difficulty === state.difficulty;
      });
    }
    if (!state.search) return list;
    return list.filter(function(item) {
      return contains(item.title, state.search) ||
             contains(item.id, state.search);
    });
  }

  function renderProblems(list) {
    if (!list.length) return '<p class="empty-tip">未找到匹配的题目。</p>';

    var html = '<table class="data-table"><thead><tr>';
    html += '<th>题号</th><th>标题</th><th>难度</th><th>链接</th>';
    html += '</tr></thead><tbody>';

    for (var i = 0; i < list.length; i++) {
      var p = list[i];
      var diffName = difficultyNames[p.difficulty] || '未知';
      html += '<tr>';
      html += '<td>' + escapeHtml(p.id) + '</td>';
      html += '<td>' + escapeHtml(p.title) + '</td>';
      html += '<td><span class="difficulty difficulty-' + p.difficulty + '">' + escapeHtml(diffName) + '</span></td>';
      html += '<td><a href="' + escapeHtml(p.url) + '" target="_blank">做题</a></td>';
      html += '</tr>';
    }

    html += '</tbody></table>';
    return html;
  }

  function filterArticles() {
    var list = state.articles;
    if (!state.search) return list;
    return list.filter(function(item) {
      return contains(item.title, state.search) ||
             contains(item.category, state.search);
    });
  }

  function renderArticles(list) {
    if (!list.length) return '<p class="empty-tip">未找到匹配的文章。</p>';

    var html = '<ul class="item-list">';
    for (var i = 0; i < list.length; i++) {
      var a = list[i];
      html += '<li>';
      html += '<h3><a href="?id=' + escapeHtml(a.id) + '#articles" onclick="loadArticle(\'' + escapeHtml(a.id) + '\');return false;">' + escapeHtml(a.title) + '</a></h3>';
      html += '<div class="item-meta">' + escapeHtml(a.date) + ' &nbsp;|&nbsp; ' + escapeHtml(a.category) + '</div>';
      html += '</li>';
    }
    html += '</ul>';
    return html;
  }

  window.loadArticle = function(id) {
    var article = null;
    for (var i = 0; i < state.articles.length; i++) {
      if (state.articles[i].id === id) {
        article = state.articles[i];
        break;
      }
    }
    if (!article) return;

    fetch(article.file)
      .then(function(r) { return r.text(); })
      .then(function(md) {
        document.getElementById('content').style.display = 'none';
        var view = document.getElementById('article-view');
        view.style.display = 'block';
        view.innerHTML = '<div class="back-link"><a href="#" onclick="backToList();return false;">&laquo; 返回列表</a></div>' + renderMarkdown(md);
        if (window.hljs) {
          hljs.highlightAll();
        }
        history.pushState(null, '', '?id=' + encodeURIComponent(id) + '#articles');
      })
      .catch(function(e) {
        alert('文章加载失败：' + e.message);
      });
  };

  window.backToList = function() {
    document.getElementById('article-view').style.display = 'none';
    document.getElementById('content').style.display = 'block';
    history.replaceState(null, '', window.location.pathname + '#articles');
  };

  function renderMarkdown(text) {
    var lines = text.replace(/\r\n/g, '\n').split('\n');
    var html = '';
    var inCode = false;
    var codeBuffer = [];
    var codeLang = '';
    var inList = false;
    var listType = '';

    function flushCode() {
      if (!inCode) return;
      var cls = codeLang ? ' class="language-' + escapeHtml(codeLang) + '"' : '';
      html += '<pre><code' + cls + '>' + escapeHtml(codeBuffer.join('\n')) + '</code></pre>';
      codeBuffer = [];
      codeLang = '';
      inCode = false;
    }

    function closeList() {
      if (!inList) return;
      html += listType === 'ol' ? '</ol>' : '</ul>';
      inList = false;
      listType = '';
    }

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];

      if (/^```/.test(line)) {
        if (inCode) {
          flushCode();
        } else {
          closeList();
          inCode = true;
          codeLang = line.replace(/^```/, '').trim();
        }
        continue;
      }

      if (inCode) {
        codeBuffer.push(line);
        continue;
      }

      var headerMatch = /^(#{1,6})\s+(.+)$/.exec(line);
      if (headerMatch) {
        closeList();
        var level = headerMatch[1].length;
        html += '<h' + level + '>' + inlineMd(headerMatch[2]) + '</h' + level + '>';
        continue;
      }

      var ulMatch = /^[\*\-\+]\s+(.+)$/.exec(line);
      var olMatch = /^\d+\.\s+(.+)$/.exec(line);
      if (ulMatch || olMatch) {
        var type = ulMatch ? 'ul' : 'ol';
        var content = ulMatch ? ulMatch[1] : olMatch[1];
        if (!inList || listType !== type) {
          closeList();
          html += type === 'ol' ? '<ol>' : '<ul>';
          inList = true;
          listType = type;
        }
        html += '<li>' + inlineMd(content) + '</li>';
        continue;
      }

      closeList();

      if (/^(---|\*\*\*|___)\s*$/.test(line)) {
        html += '<hr />';
        continue;
      }

      if (/^\s*$/.test(line)) {
        continue;
      }

      html += '<p>' + inlineMd(line) + '</p>';
    }

    flushCode();
    closeList();
    return html;
  }

  function inlineMd(text) {
    return escapeHtml(text)
      .replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^\*]+)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
  }

  function contains(value, search) {
    if (value === null || value === undefined) return false;
    return String(value).toLowerCase().indexOf(search) !== -1;
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  init();
})();
