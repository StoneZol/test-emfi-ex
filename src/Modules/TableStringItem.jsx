import React, { useEffect, useState } from 'react';
import Spinner from './Spinner';
import { accessToken } from './token';

const TableStringItem = ({ item, openItemId, setOpenItemId }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const BaseUrl = `https://miha2000rus.amocrm.ru/api/v4/tasks?filter[entity_type]=leads&filter[entity_id]=${item.id}`;

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${BaseUrl}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Ошибка при получении данных');
            }

            const result = await response.json();
            setLoading(false);
            setTasks(result._embedded.tasks);
        } catch (error) {
            console.error('Ошибка:', error);
            setLoading(false);
        }
    };

    // Форматирование даты
    const formatDate = (timestamp) => {
        const date = new Date(timestamp * 1000); // Преобразуем UNIX timestamp
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    };


    const handleCardClick = () => {
        if (openItemId === item.id) {
            // Закрыть карточку, если она уже открыта
            setOpenItemId(null);
        } else {
            // Открыть новую карточку
            setOpenItemId(item.id);
            fetchTasks();
        }
    };

    const handleCardClose = () => {
        setOpenItemId(null); // Закрываем карточку
    }

    const compareDates = (dateStr) => {
        const [day, month, year] = dateStr.split('.').map(Number);
        const date = new Date(year, month - 1, day);
        return date;
    };

    const getStatusColor = (completeTill) => {
        const currentDate = compareDates(formatDate(Date.now() / 1000)).getTime();
        const completeDate = compareDates(formatDate(completeTill)).getTime();

        if (completeDate < currentDate) {
            return 'red'; // Просрочено
        } else if (completeDate == currentDate) {
            return 'green'; // Сегодня
        } else {
            return 'yellow'; // Более чем через день
        }
    };

    return (
        <>
            {openItemId === item.id ? (
                // Если карточка открыта
                <div className="TableItemTasks">
                    {loading ? (
                        <Spinner />
                    ) : (
                        <div className='widthFull' onClick={handleCardClose}>
                            <h3 align="center">Задачи</h3>
                            {tasks.length > 0 ? (
                                tasks.map((task) => (
                                    <div className='TasksAbout' key={task.id}>
                                        <span>ID задачи: {task.id}</span>
                                        <span>Дата: {formatDate(task.complete_till)}</span>
                                        <span>Статус:  <svg width="16" height="16" style={{ marginLeft: '5px' }}>
                                                <circle cx="8" cy="8" r="8" fill={getStatusColor(task.complete_till)} />
                                            </svg></span>
                                    </div>
                                ))
                            ) : (
                                <span>Нет задач</span>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                // Если карточка закрыта
                <div className="TableItem" onClick={handleCardClick}>
                    <span>{item.id}</span>
                    <span>{item.name}</span>
                    <span>{item.price}€</span>
                </div>
            )}
        </>
    );
};

export default TableStringItem;

