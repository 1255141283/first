class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.categories = JSON.parse(localStorage.getItem('categories')) || 
            ['工作', '学习', '生活', '运动', '娱乐', '购物', '阅读', '旅行'];
        this.currentFilter = 'all';
        this.currentSort = 'time';
        this.initializeElements();
        this.addEventListeners();
        this.startTimeCheck();
        this.updateCurrentDate();
        this.render();
        this.updateCategorySuggestions();
    }

    initializeElements() {
        this.form = document.getElementById('todo-form');
        this.input = document.getElementById('todo-input');
        this.datetime = document.getElementById('todo-datetime');
        this.list = document.getElementById('todo-list');
        this.filters = document.querySelector('.todo-filters');
        this.todoCount = document.getElementById('todo-count');
        this.clearCompletedBtn = document.getElementById('clear-completed');
        this.priority = document.getElementById('todo-priority');
        this.category = document.getElementById('todo-category');
        this.description = document.getElementById('todo-description');
        this.sortSelect = document.getElementById('sort-select');
        this.currentDate = document.getElementById('current-date');
        this.categoryStats = document.getElementById('todo-categories');
    }

    addEventListeners() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTodo();
        });

        this.filters.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                this.setFilter(e.target.dataset.filter);
            }
        });

        this.clearCompletedBtn.addEventListener('click', () => {
            this.clearCompleted();
        });

        this.sortSelect.addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.render();
        });
    }

    startTimeCheck() {
        // 每分钟检查一次是否有过期的待办事项
        setInterval(() => this.render(), 60000);
    }

    updateCurrentDate() {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        this.currentDate.textContent = new Date().toLocaleDateString('zh-CN', options);
    }

    updateCategorySuggestions() {
        const datalist = document.getElementById('category-suggestions');
        datalist.innerHTML = this.categories
            .map(category => `<option value="${category}">`)
            .join('');
    }

    addTodo() {
        const text = this.input.value.trim();
        const datetime = this.datetime.value;
        const priority = this.priority.value;
        const category = this.category.value.trim();
        const description = this.description.value.trim();

        if (text) {
            const todo = {
                id: Date.now(),
                text,
                datetime,
                priority,
                category,
                description,
                completed: false
            };
            this.todos.push(todo);
            
            // 如果是新分类，添加到分类列表中
            if (category && !this.categories.includes(category)) {
                this.categories.push(category);
                localStorage.setItem('categories', JSON.stringify(this.categories));
                this.updateCategorySuggestions();
            }

            this.input.value = '';
            this.datetime.value = '';
            this.category.value = '';
            this.description.value = '';
            this.saveAndRender();
        }
    }

    toggleTodo(id) {
        this.todos = this.todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );
        this.saveAndRender();
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveAndRender();
    }

    clearCompleted() {
        this.todos = this.todos.filter(todo => !todo.completed);
        this.saveAndRender();
    }

    setFilter(filter) {
        this.currentFilter = filter;
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.render();
    }

    formatDateTime(datetime) {
        if (!datetime) return '';
        const date = new Date(datetime);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    isOverdue(todo) {
        if (!todo.datetime || todo.completed) return false;
        return new Date(todo.datetime) < new Date();
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(todo => !todo.completed);
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            case 'overdue':
                return this.todos.filter(todo => this.isOverdue(todo));
            default:
                return this.todos;
        }
    }

    sortTodos(todos) {
        switch (this.currentSort) {
            case 'time':
                return todos.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
            case 'priority':
                const priorityOrder = { urgent: 0, important: 1, normal: 2 };
                return todos.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
            case 'category':
                return todos.sort((a, b) => (a.category || '').localeCompare(b.category || ''));
            default:
                return todos;
        }
    }

    updateCategoryStats() {
        const categories = {};
        this.todos.forEach(todo => {
            if (todo.category && !todo.completed) {
                categories[todo.category] = (categories[todo.category] || 0) + 1;
            }
        });
        
        const statsHtml = Object.entries(categories)
            .map(([category, count]) => `${category}(${count})`)
            .join(' | ');
        
        this.categoryStats.textContent = statsHtml ? `分类: ${statsHtml}` : '';
    }

    render() {
        const filteredTodos = this.sortTodos(this.getFilteredTodos());
        
        this.list.innerHTML = filteredTodos.map(todo => `
            <li class="todo-item ${todo.completed ? 'completed' : ''} ${this.isOverdue(todo) ? 'overdue' : ''}">
                <input 
                    type="checkbox" 
                    ${todo.completed ? 'checked' : ''} 
                    onchange="todoApp.toggleTodo(${todo.id})"
                >
                <div class="content">
                    <div class="title">
                        <span>${todo.text}</span>
                        <span class="priority-badge priority-${todo.priority}">${todo.priority}</span>
                        ${todo.category ? `<span class="category-tag">${todo.category}</span>` : ''}
                    </div>
                    ${todo.description ? `<div class="description">${todo.description}</div>` : ''}
                </div>
                <span class="time">${this.formatDateTime(todo.datetime)}</span>
                <button 
                    class="delete-btn" 
                    onclick="todoApp.deleteTodo(${todo.id})"
                >删除</button>
            </li>
        `).join('');

        const activeCount = this.todos.filter(todo => !todo.completed).length;
        this.todoCount.textContent = `剩余项目: ${activeCount}`;
        this.updateCategoryStats();
    }

    saveAndRender() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
        this.render();
    }
}

// 初始化应用
const todoApp = new TodoApp(); 