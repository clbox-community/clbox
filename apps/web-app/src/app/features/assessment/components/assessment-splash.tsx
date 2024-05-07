import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import React, { FC } from 'react';

export const AssessmentSplash: FC<{confirm: () => void}> = ({ confirm }) => <Card>
    <CardContent>
        <p>Kilka wskazówek przed rozpoczęciem ankiety:</p>
        <ul>
            <li>Ankieta służy do testowania i zbierania opinii. Testujemy i ulepszamy pytania, więc spodziewaj się błędów i niespójności.</li>
            <li>Na tym etapie ankieta nie służy do oceny.</li>
            <li>Wyniki tej ankiety są przydatne do tworzenia celów. CL pomoże Ci ją omówić uwzględniając motywację konkretnych pytań i wskazówki.</li>
            <li>Jeśli chcesz dodać komentarz, zrób to przed wyborem odpowiedzi, ponieważ wybór wysyła odpowiedź.</li>
            <li>Jeśli chcesz dodać opinię do pytania, kliknij przycisk (?) i dodaj ją przed wyborem odpowiedzi, ponieważ wybór wysyła odpowiedź.</li>
            <li>W swoich odpowiedziach skup się na faktach, a nie na ich ocenie czy analizie co, kto powinien robić. Po prostu zaznacz, jak jest. Na przykład, jeśli zadanie w zespole nie
                jest wykonywane, zaznacz to, a CL oceni, czy to w ogóle wpływa na ocenę względem zespołu, projektu czy planów rozwojowych.
            </li>
            <li>Każde pytanie oceniane jest pod względem odpowiedzi oczekiwanej na koniec ścieżki rozwoju lidera w Consdata oraz czy jest to odpowiedź oczekiwana/spodziewana na bieżącym
                poziomie ocenianego.
            </li>
            <li>Pamiętaj, że przyciski mają dwa wiersze. Jeśli "zawsze i nigdy" nie brzmi dobrze, zastanów się, czy "zdecydowanie tak, nie" nie pasuje lepiej.</li>
            <li>Nie trzeba nadmiernie analizować pytań. Odpowiadaj na nie szybko, opierając się na pierwszych myślach.</li>
            <li>Jeśli czujesz potrzebę dodania komentarza do odpowiedzi, być może pytanie jest za mało precyzyjne i możesz to napisać w feedbacku do pytania.</li>
            <li>Jeśli masz uwagi, koniecznie je zbierz i zgłoś. Jest to okres testowania, więc nie ma konsekwencji dla Twojej oceny. Problemy merytoryczne mogą wpłynąć na jakość oceny, gdy
                ankieta zostanie wprowadzona do oceny rocznej.
            </li>
            <li>Ważne jest, aby uczciwie i szczerze dokonywać autooceny. Obszary do poprawy nie wpłyną na bieżącą ocenę, ale cele z nich wynikające będą postrzegane jako sukces w usprawnianiu podejścia w ocenie rocznej.</li>
            <li>Zawsze możesz przerwać ankietę i wrócić do niej później. Twoje zapisane odpowiedzi są trwałe.</li>
            <li>Docelowo liczba pytań w ankiecie będzie zmniejszała się z każdą kolejną oceną okresową. Po ocenie CL może oznaczyć pytania dla których odpowiedź jest już znana i potwierdzona, co sprawi że przyszłe ankiety nie będą ich już zawierały. Pierwsze ankiety są największe żeby ustalić stan wyjściowy.</li>
        </ul>
    </CardContent>
    <CardActions>
        <Button variant="text" size="small" onClick={confirm}>
            Przejdź do ankiety
        </Button>
    </CardActions>
</Card>;
