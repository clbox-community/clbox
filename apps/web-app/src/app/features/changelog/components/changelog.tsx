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
