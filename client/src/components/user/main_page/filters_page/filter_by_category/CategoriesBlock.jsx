import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Left } from '../../../../../assets/svgs/Svgs'
import { SearchByCity } from '../../header/search_vacancy/search_by_city/SearchByCity'
import { Options } from '../../../../../assets/OptionsList'
import classes from './CategoriesBlock.module.scss'


export const CategoriesBlock = props => {
    const { categories } = Options()
    const [cityLabel, setCityLabel] = useState()
    const [cityValue, setCityValue] = useState()
    const vacancies = props.vacancies
    const vacanciesCategories = cityValue ? vacancies.filter(v => v.cityValue === cityValue) : vacancies
    const [appearCitiesDropDown, setAppearCitiesDropDown] = useState()

    useEffect(() => {
        let categories = document.getElementById("categories")
        document.addEventListener('click', function(event) {
            let isClickInside = categories.contains(event.target)
            if (!isClickInside) {
                setAppearCitiesDropDown(false)
            }
    
        })
    }, [])
  
 
    return (
        <div  className={classes.container}>
            <div id="categories" className={classes.wrapper}>
            <span className={classes.link}><a href="/filters"><Left />Найти вакансии</a></span>
            <h4 className={classes.text}><b>Поиск вакансий по категориям</b></h4>
            <span className={classes.search}>
            <SearchByCity
                appearCitiesDropDown={appearCitiesDropDown}
                setAppearCitiesDropDown={setAppearCitiesDropDown}
                 cityValue={cityValue}
                 setCityValue={setCityValue}
                 cityLabel={cityLabel}
                 setCityLabel={setCityLabel}
                 />
            </span>
            <ul  className={classes.categoriesWrapper}>
                {categories.map(c => (
                    <li>
                        <Link to={`/vacancies${cityValue ? '?city=' + cityValue + '&category=' + c.value + '&page=1'
                        
                        : '?category=' + c.value}` + "&by-category=1&page=1" }>
                            {c.label}
                        </Link>
                        <span>
                            {vacanciesCategories.filter(v => v.category === c.value).length}
                        </span>
                    </li>
                ))}
            </ul>
            </div>
        </div>
    )
}