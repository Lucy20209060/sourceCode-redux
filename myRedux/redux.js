// 定一个 reducer
function reducer(state, action) {
    /* 初始化 state 和 switch case */
    if (!state) {
        return {
            title: {
                text: 'React.js 小书',
                color: 'red'
            },
            content: {
                text: 'React.js 小书内容',
                color: 'blue'
            }
        }
    }
    switch (action.type) {
        case 'UPDATE_TITLE_TEXT':
            return {
                ...state,
                title: {
                    ...state.title,
                    text: action.text
                }
            };
        case 'UPDATE_TITLE_COLOR':
            return {
                ...state,
                title: {
                    ...state.title,
                    color: action.color
                }
            };
        default:
            return state;
    }
}

// 生成 store
function createStore(reducer) {
    let state = null;
    const listeners = [];
    const subscribe = (listener) => listeners.push(listener);
    const getState = () => state;
    const dispatch = (action) => {
        state = reducer(state, action);
        listeners.forEach((listener) => {
            listener();
        });
    };
    dispatch({});   // 初始化 state
    return {
        getState,
        dispatch,
        subscribe
    }
}

// 生成 store
const store = createStore(reducer);
let oldState = store.getState();    // 缓存旧的state

// 监听数据变化重新渲染页面
store.subscribe(() => {
    const newState = store.getState();
    renderApp(newState, oldState);
    oldState = newState;
});

function renderTitle(newTitle, oldTitle) {
    if (newTitle === oldTitle) {
        return;
    }
    console.log('render title...')
    const titleDOM = document.getElementById('title');
    // console.log(titleDOM)
    titleDOM.innerHTML = newTitle.text;
    titleDOM.style.color = newTitle.color;
}

function renderContent(newContent, oldContent) {
    if (newContent === oldContent) {
        return;
    }
    console.log('render content...')
    const contentDOM = document.getElementById('content');
    contentDOM.innerHTML = newContent.text;
    contentDOM.style.color = newContent.color;
}

function renderApp(newAppState, oldAppState = {}) {
    if (newAppState === oldAppState) {
        return;
    }
    console.log('render app...')
    renderTitle(newAppState.title, oldAppState.title);
    renderContent(newAppState.content, oldAppState.content);
}

// 首次渲染页面
renderApp(store.getState());
console.log(store.getState())

// 后面可以随意 dispatch 了，页面自动更新
store.dispatch({type: 'UPDATE_TITLE_TEXT', text: '《React.js 小书》'}); // 修改标题文本
// store.dispatch({type: 'UPDATE_TITLE_COLOR', color: 'blue'}); // 修改标题颜色