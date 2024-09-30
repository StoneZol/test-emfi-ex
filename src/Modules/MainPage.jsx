import React, {useEffect, useState} from 'react';
import About from './About';
import TableStringItem from './TableStringItem';
import { accessToken } from './token';
const MainPage = () => {

    const [aboutToggle, setAboutToggle] = useState(false)
    
    const [currentPage, setCurrentPage] = useState(1); // Текущая страница
    const [hasNext, setHasNext] = useState(true); // Есть ли следующая страница
    const BaseUrl = `https://miha2000rus.amocrm.ru/api/v4/leads?limit=3&page=${currentPage}`
    const [leads, setLeads] = useState([]); // Храним сделки
    const [openItemId, setOpenItemId] = useState(null); // Храним ID открытой карточки

    const toggleAbout = () =>{
        setAboutToggle(!aboutToggle)
    }

    const fetchLeads = async () => {
        try {
            const response = await fetch(`${BaseUrl}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Ошибка при получении данных');
            }

            const result = await response.json();
            setLeads((prevLeads) => [
                ...prevLeads,
                ...result._embedded.leads
            ]);
            console.log('Сделки:', result._embedded.leads);
            if (result._links.next) {
                setHasNext(true); // Если есть поле next, продолжаем
            } else {
                setHasNext(false); // Останавливаем запросы, если нет next
            }
        } catch (error) {
            console.error('Ошибка:', error);
        }
    };

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (hasNext) {
                fetchLeads();
                setCurrentPage((prevPage) => prevPage + 1); // Увеличиваем номер страницы
            }
        }, 1000);

        return() => clearInterval(intervalId); // Очищаем интервал при размонтировании
    }, [accessToken, hasNext, currentPage]);

    return (
        <div>
            <button onClick={toggleAbout}>Задание</button>
            {aboutToggle ? (<About/>):(<></>) }
            <h2>Таблица сделок</h2>
            <div className='LeadsTable'>
                <div className={`TableItem noPointer`}>
                    <span>ID</span>
                    <span>Название</span>
                    <span>Сумма €</span>
                </div><br/> {leads.map((item) => (<TableStringItem key={item.id} item={item} openItemId={openItemId} setOpenItemId={setOpenItemId}/>))}
            </div>
        </div>
    );
}

export default MainPage;
