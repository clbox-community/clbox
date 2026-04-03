import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import React, { FC } from 'react';

export const AssessmentSplash: FC<{confirm: () => void}> = ({ confirm }) => <Card>
    <CardContent>
        <p>Kilka wskazówek przed rozpoczęciem ankiety:</p>
        <ul>
            <li>Stosuj zdrowy rozsądek i pamiętaj, że na każdym etapie procesu są ludzie z którymi można porozmawiać :)</li>
            <li>W swoich odpowiedziach skup się na faktach, a nie na ich ocenie czy analizie. Po prostu zaznacz, jak jest. Przykładowo, jeśli zadanie w zespole nie jest wykonywane, zaznacz że "nie robi", a CL oceni, czy to w ogóle wpływa na ocenę względem zespołu, projektu i planów rozwojowych.</li>
            <li>Nie analizuj nadmiernie pytań. Odpowiadaj na nie szybko, opierając się na pierwszych myślach i odczuciach.</li>
            <li>Gdy nie potrafisz powiedzieć czy oceniana osoba coś robi zastanów się czy zauważasz, że tego nie robi. Oceń, czy potrafisz znaleźć sytuacje, w których widać, że coś nie jest robione. Jeżeli nie potrafisz czemuś zaprzeczyć to zakładaj dobrą wolę i stosuj kredyt zaufania.</li>
            <li>Wybierając odpowiedzi na skali pamiętaj, że oceniamy ogólne zachowania i postawy, można zaznaczyć nigdy nawet jeśli kiedyś się coś komuś przytrafiło. Nigdy i zawsze oznacza, że coś jest pomijalne. W 95% przypadków jeśli potrzebujesz liczbowej miary :)</li>
            <li>W ankiecie odpowiadaj zgodnie z własnymi obserwacjami i odczuciami. Oceniasz czy zauważasz/uważasz, że ktoś coś robi i czy pracujesz polegającym na tym bez próby wydania jednoznacznej oceny jaki ktoś jest. Skupiamy się na obserwacjach i faktach bez wchodzenia w ocenę.</li>
            <li>Jeśli chcesz dodać komentarz, zrób to przed wyborem odpowiedzi, ponieważ wybór wysyła odpowiedź.</li>
            <li>Jeśli chcesz dodać opinię do pytania, kliknij przycisk (?) i dodaj ją przed wyborem odpowiedzi, ponieważ wybór wysyła odpowiedź.</li>
            <li>Jeśli masz uwagi, koniecznie je zbierz i zgłoś. Ciągły rozwój metodyki oceny jest kluczem do jej skutecznego stosowania.</li>
            <li>Zawsze możesz przerwać ankietę i wrócić do niej później. Twoje zapisane odpowiedzi są trwałe.</li>
            <li>Każde pytanie oceniane jest pod względem odpowiedzi oczekiwanej od idealnego członka zespołu oraz jakie odpowiedzi są poprawne na obecnym poziomie. Złączenie tych dwóch pozwala budować ścieżkę rozwoju oraz znajdywać bieżące braki.</li>
            <li>Na podstawie wyników ankiety Chapter Leader przygotuje opisowe zestawienie postaw i zachowań które warto rozwijać w ramach indywidualnej ścieżki rozwoju.</li>
            <li>W przyszłości, liczba pytań w ankiecie będzie zmniejszała się z każdą kolejną oceną okresową. Po ocenie CL może oznaczyć pytania dla których odpowiedź jest już znana i potwierdzona, co sprawi że przyszłe ankiety nie będą ich już zawierały. Pierwsze ankiety są największe żeby ustalić stan wyjściowy.</li>
        </ul>
    </CardContent>
    <CardActions>
        <Button variant="text" size="small" onClick={confirm}>
            Przejdź do ankiety
        </Button>
    </CardActions>
</Card>;
