let sideNav = document.getElementById("mySidenav");
let searchIcon = document.getElementById("icon-search");
let searchNav = document.getElementById("nav-search");
let newsBoard = document.getElementById("news-board");

let searchBtn = document.getElementById("nav-button");
let searchIpt = document.getElementById("nav-input");

let downCtrl = document.getElementById("down-control");
let upCtrl = document.getElementById("up-control");

let menusList = document.querySelectorAll(".menus-list button");

let url;
let news = [];
let page = 1;
let total_pages = 0;
let lang = "kr";

downCtrl.addEventListener("click", ()=>{
    window.scrollTo(0, document.querySelector("body").scrollHeight);
});
upCtrl.addEventListener("click", ()=>{
    window.scrollTo(0, 0);
});

function openNav() {
    sideNav.style.width = "250px";
}
function closeNav() {
    sideNav.style.width = "0";
}
searchIcon.addEventListener("click", () => {
    if (searchNav.style.display === "none") {
        searchNav.style.display = "inline";
        searchIpt.focus();
    } else {
        searchNav.style.display = "none";
    }
});
menusList.forEach((menu) => menu.addEventListener("click", (event) => getByTopic(event)));

searchBtn.addEventListener("click", () => searchTopic());
let enterSearchEvent = () => {
    if (window.event.key == "Enter")
        searchTopic();
}

const getNews = async () => {
    try {
        let header = new Headers({
            'x-api-key': '9JsKd2qzY7-D7gncS6-rClGnsJvjI7ejy_lrXbckTLg'
        });
        url.searchParams.set('page', page);
        console.log("url : ", url);
        let response = await fetch(url, { headers: header });
        let data = await response.json();

        if (response.status == 200) {
            if (data.total_hits == 0) {
                throw new Error("해당 뉴스 없음");
            }
            console.log("받는 데이터 : ", data);
            total_pages = data.total_pages;
            page = data.page;
            console.log("page : ",page);
            news = data.articles;
            render();
            pagenation();
        } else {
            throw new Error(data.message);
        }

    } catch (error) {
        console.log("잡힌 에러 : ", error.message);
        errorRender(error.message);
    }
}

const getLatestNews = async () => {
    url = new URL(
        `https://api.newscatcherapi.com/v2/latest_headlines?countries=${lang}&page_size=10`
    );
    getNews();
}
const getByTopic = async (event) => {
    page = 1;
    let topic_sorce = event.target.textContent.toLowerCase();

    url = new URL(
        `https://api.newscatcherapi.com/v2/latest_headlines?countries=${lang}&page_size=10&topic=${topic_sorce}`
    );
    getNews();
}

const searchTopic = async () => {
    let topic_sorce = searchIpt.value;
    searchIpt.value = "";

    url = new URL(
        `https://api.newscatcherapi.com/v2/search?q=${topic_sorce}&countries=${lang}&page_size=10`
    );
    getNews();
}

const chooseLangTopic = (event) => {
    lang = event.options[event.selectedIndex].value;
    console.log("lang : ", lang);

    url = new URL(
        `https://api.newscatcherapi.com/v2/latest_headlines?countries=${lang}&page_size=10`
    );
    getNews();
}

const render = () => {
    let newsHTML = "";
    console.log("news :", news);

    try {
        newsHTML = news.map(item => {
            return `
        <div class="row news">
            <div class="col-lg-4">
                <img class="news-img-size" src=${item.media || "/images/no-picture-available.jpg"} />
            </div>
            <div class="col-lg-8 news-in-wrap">
                <div>
                    <h2>${item.title}</h2>
                    <p>${(item.summary == "" || item.summary == null) ?
                    "내용없음" :
                    (item.summary.length >= 200) ? item.summary.substr(0, 200) + "..." : item.summary}</p>
                </div>
                <div class="news-bottom">
                    <div>${item.rights || "no source"} * ${moment(item.published_date).startOf('hour').fromNow()}
                        (${item.published_date})</div>
                        <div><a href=${item.link} target="_blank">link>></a></div>
                </div>
            </div>
        </div>`;
        }).join('');
    } catch (error) {
        newsHTML =
            `<div class="no-news alert alert-warning" role="alert">
            <h1>해당 뉴스 없음</h1>
        </div>`
    }
    newsBoard.innerHTML = newsHTML;
}

const errorRender = (message) => {
    let errorHTML =
        `<div class="no-news alert alert-danger" role="alert">
            ${message}
        </div>`
    newsBoard.innerHTML = errorHTML;
}

const pagenation = () => {
    let pagenationHTML = '';
    let pageGroup = Math.ceil(page / 5);
    //현재 보여주는 그룹 페이지
    let last = pageGroup * 5;
    let first = last - 4;
    //전체 그룹 페이지의 마지막
    let last_group_page = total_pages;
    let last_group = last_group_page - 4;

    //전체 페이지의 끝
    let show_last_page = page<last_group_page-2 
        ? page<4 ? last : page+2
        : last ;

    //현재 보여줄 페이지
    let showing_page = page<4 ? first 
        : page>show_last_page-2 ? last-4 : page-2;

    let log_Arr = [
        { page: page },
        { first: first },
        { last: last },
        { show_last_page: show_last_page },
        { showing_page: showing_page },
        { total_pages: total_pages},
        { last_group_page: last_group_page}];
    console.log(log_Arr);


    pagenationHTML = `<li class="page-item ${page <= 3 ? "d-none" : ""}">
        <a class="page-link" href="#" aria-label="Previous" onclick="moveToPage(${1})">
        <span aria-hidden="true">&laquo;</span>
        </a>
    </li>
    <li class="page-item ${page == 1 ? "d-none" : ""}">
        <a class="page-link" href="#" aria-label="Previous" onclick="moveToPage(${page - 1})">
        <span aria-hidden="true">&lt;</span>
        </a>
    </li>`;

    for (showing_page; showing_page <= show_last_page; showing_page++) {
        pagenationHTML += `<li class="page-item ${page == showing_page ? "active" : ""}"><a class="page-link"
            href="#" onclick="moveToPage(${showing_page})">${showing_page}</a></li>`;
    }

    pagenationHTML += `<li class="page-item ${page == last_group_page ? "d-none" : ""}">
            <a class="page-link" href="#" aria-label="Next" onclick="moveToPage(${page + 1})">
            <span aria-hidden="true">&gt;</span>
            </a>
        </li>
        <li class="page-item ${page <= last_group_page && page >= last_group ? "d-none" : ""}">
            <a class="page-link" href="#" aria-label="Next" onclick="moveToPage(${last_group_page})">
                <span aria-hidden="true">&raquo;</span>
            </a>
        </li>
        `;
    document.querySelector(".pagination").innerHTML = pagenationHTML;
}

const moveToPage = (pageNum) => {
    page = pageNum;
    getNews();
}

getLatestNews();