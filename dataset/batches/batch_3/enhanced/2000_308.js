setcpm(120/4);
$: note("g2 a#2").scale("c2:minor").sound("piano").room(0.5).gain(0.4);
$: note("d5 c#5 a4").scale("c2:minor").sound("kick").lpf(2000).gain(0.5);
$: s("sd ~ sd ~").gain(0.7);
