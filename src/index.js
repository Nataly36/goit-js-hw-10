import './css/styles.css';
import { Report } from 'notiflix/build/notiflix-report-aio';
import debounce from 'lodash.debounce';


const DEBOUNCE_DELAY = 300;

const countriesList = document.querySelector('.country-list');
const countryInfo = document.querySelector('.country-info');
const searchBox = document.querySelector('#search-box');
const body = document.querySelector('body');

body.style.backgroundImage =
  'radial-gradient( circle 610px at 5.2% 51.6%,  rgba(5,8,114,1) 0%, rgba(7,3,53,1) 97.5% )';
countriesList.style.visibility = 'hidden';
countryInfo.style.visibility = 'hidden';

searchBox.addEventListener('input', debounce(onInputSearch, DEBOUNCE_DELAY));



function onInputSearch(e) {
  const value = searchBox.value.trim();
  console.log(value);

  if (!value) {
    addHidden();
    clearInterfaceUI();
    return;
  }

  fetchCountries(value)
    .then(data => {
      if (data.length > 10) {
        Notify.info(
          'Too many matches found. Please enter a more specific name.'
        );
      }
      renderCountries(data);
    })
    .catch(err => {
      clearInterfaceUI();
      Notify.failure('Oops, there is no country with that name');
    });
}

const generateMarkupCountryInfo = data =>
  data.reduce(
    (acc, { flags: { svg }, name, capital, population, languages }) => {
      console.log(languages);
      languages = Object.values(languages).join(', ');
      console.log(name);
      return (
        acc +
        ` <img src="${svg}" alt="${name}" width="320" height="auto">
            <p> ${name.official}</p>
            <p>Capital: <span> ${capital}</span></p>
            <p>Population: <span> ${population}</span></p>
            <p>Languages: <span> ${languages}</span></p>`
      );
    },
    ''
  );

const generateMarkupCountryList = data =>
  data.reduce((acc, { name: { official, common }, flags: { svg } }) => {
    return (
      acc +
      `<li>
        <img src="${svg}" alt="${common}" width="70">
        <span>${official}</span>
      </li>`
    );
  }, '');

function renderCountries(result) {
  if (result.length === 1) {
    countriesList.innerHTML = '';
    countriesList.style.visibility = 'hidden';
    countryInfo.style.visibility = 'visible';
    countryInfo.innerHTML = generateMarkupCountryInfo(result);
  }
  if (result.length >= 2 && result.length <= 10) {
    countryInfo.innerHTML = '';
    countryInfo.style.visibility = 'hidden';
    countriesList.style.visibility = 'visible';
    countriesList.innerHTML = generateMarkupCountryList(result);
  }
}

function clearInterfaceUI() {
  countriesList.innerHTML = '';
  countryInfo.innerHTML = '';
}

function addHidden() {
  countriesList.style.visibility = 'hidden';
  countryInfo.style.visibility = 'hidden';
}

const BASE_URL = 'https://restcountries.com/v3.1/name/';
const searchParams = new URLSearchParams({
    fields: 'name,capital,population,flags,languages,',
});

export const fetchCountries = (name) => {
    return fetch(`${BASE_URL}${name}?${searchParams}`)
        .then(response => {
            if (response.status === 404) {
                throw new Error(response.status);
            }
            return response.json();
        });
};