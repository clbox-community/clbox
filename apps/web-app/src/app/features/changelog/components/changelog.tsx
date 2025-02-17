import styled from "styled-components";

export const Changelog = () => {
    return <Layout>
        <h2>Changelog</h2>
        <div>
            {changes.map(change => <div key={change.date}>
                <div>{change.date}</div>
                <ul>
                    {change.items.map((item, index) => <div key={index}>
                        <li>{item.summary}</li>
                    </div>)}
                </ul>
            </div>)}
        </div>
    </Layout>;
};

const Layout = styled.div`
    max-width: 1000px;
    margin: 0 auto 32px auto;
`;

const changes = [
    {
        date: '2025-02-17',
        items: [
            {summary: 'Obsługa ról użytkownika (role w zespole, tj. QA, Dev, PO; wyświetlanie w profilu)'},
            {summary: 'Filtrowanie pytań oceny okresowej na podstawie ról użytkownika wypełniającego ankietę'}
        ]
    },
    {
        date: '2024-08-21',
        items: [
            {summary: 'Podsumowanie oceny okresowej domyślnie prezentuje wszystkie pytania (zamiast dotychczasowego prezentowania tylko obszarów do usprawnienia)'},
            {summary: 'Zablokowanie możliwości usuwania oceniających w definicji ankiety oceny okresowej (do czasu zaimplementowania obsługi usuwania)'},
            {summary: 'Pytania w podsumowaniu oceny okresowej są prezentowane w kolejności, w której były prezentowane w ankiecie'},
            {summary: 'Poprawa prezentowania lokalnych dat'},
        ]
    },
    {
        date: '2024-08-16',
        items: [
            {summary: 'Ankiety oceny okresowej można edytować i dodawać do nich kolejne osoby oceniające'},
        ]
    },
    {
        date: '2024-08-06',
        items: [
            {summary: 'Komentarze i feedbacki w ocenie okresowej zapisują się również w przypadku nawigacji dalej/wstecz bez zmiany odpowiedzi'},
        ]
    },
    {
        date: '2024-07-22',
        items: [
            {summary: 'Możliwość określenia osób upoważnionych podczas tworzenia ankiety oceny okresowej'},
            {summary: 'Otwarte pytania catch-all na końcu ankiety oceny okresowej'},
        ]
    },
    {
        date: '2024-07-02',
        items: [
            {summary: 'Ankieta oceny okresowej wspiera nawigację do poprzedniego/kolejnego pytani bez konieczności wybierania jeszcze raz tej samej odpowiedzi'},
            {summary: 'Możliwość filtrowania obszarów roadmapy uczenia po labelkach'},
        ]
    },
    {
        date: '2024-07-01',
        items: [
            {summary: 'Ankieta oceny okresowej może prezentować pytania w dodatkowych skalach (np. liczbowej z opisami na potrzeby oceny kompetencji technologicznych)'},
        ]
    },
    {
        date: '2024-05-24',
        items: [
            {summary: 'Tabelka podsumowania kompetencji w chapterze'},
        ]
    },
    {
        date: '2024-05-21',
        items: [
            {summary: 'Ankieta oceny okresowej pokazuje tylko jeden zestaw odpowiedzi zależnie od typu pytania.'},
        ]
    },
    {
        date: '2024-05-08',
        items: [
            {summary: 'Usprawnienia ekrany wyników oceny okresowej: grupowanie odpowiedzi w kategorie, wyświetlanie komentarzy i motywacji pytań oraz opisów kategorii.'},
        ]
    },
    {
        date: '2024-05-07',
        items: [
            {summary: 'Możliwość powrotu do poprzednich pytań w ankiecie oceny okresowej.'},
        ]
    },
    {
        date: '2024-04-29',
        items: [
            {summary: 'Lista ankiet domyślnie ukrywa wszystkie ankiety starsze niż 3 miesiące.'},
        ]
    },
    {
        date: '2024-04-26',
        items: [
            {summary: 'Możliwość tworzenia ankiet zawierających wszystkie pytania na jednej stronie (np. do głosowania nad skill tree).'},
        ]
    },
    {
        date: '2024-04-10',
        items: [
            {summary: 'Sekcja na komentarz do każdego pytania ankiety oceny okresowej.'},
            {summary: 'Szacowanie czasu potrzebnego do ukończenia ankiety okresowej na podstawie średniego czasu odpowiedzi wcześniejszych pytań.'},
            {summary: 'Ekran podsumowania ankiety oceny.'},
        ]
    },
    {
        date: '2024-01-22',
        items: [
            {summary: 'Profil użytkownika wyświetlający dane osobowe przechowane w clbox.'}
        ]
    },
    {
        date: '2024-01-19',
        items: [
            {summary: 'Ankiety oceny okresowej: przeglądanie, tworzenie, wypełnianie oczekujących.'}
        ]
    },
    {
        date: '2023-06-08',
        items: [
            {summary: 'Zmiana struktury Ścieżki rozwoju technologicznego na dwupoziomową z etykietami obszarów.'},
            {summary: 'Ostrzeżenie o braku implementacji zapisu wartości checkboxów autooceny w kategoriach ścieżki rozwoju technologicznego.'},
            {summary: 'Uzupełnienie polskiego tłumaczenia w filtrze nowych feedbacków.'},
        ]
    },
    {
        date: '2023-06-07',
        items: [
            {summary: 'Przeglądanie Roadmapy uczenia tematów technologicznych z podziałem na obszary i umiejętności.'}
        ]
    },
    {
        date: '2023-05-30',
        items: [
            {summary: 'Prototyp ekranu ścieżki uczenia dla konkretnej technologii w ramach roadmap / self-study.'}
        ]
    },
    {
        date: '2022-12-27',
        items: [
            {summary: 'Wielopoziomowego menu głównej nawigacji w celu poprawy organizacji i prezentacji przed dodaniem nowych funkcjonalności.'},
            {summary: 'Strona Changelog na potrzeby prezentowania listy wprowadzanych zmian.'},
            {summary: 'Przeglądanie macierzy kompetencji członków chapteru dla chapter leaderów.'}
        ]
    }
].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
);
