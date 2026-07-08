setcpm(120/4);
$: s("hh*8").gain(0.15);
$: note("e5 c#5").scale("c2:minor").sound("piano").lpf(200).room(0.5).gain(0.4);
$: s("bd*4 ~ sd ~").gain(0.8);
