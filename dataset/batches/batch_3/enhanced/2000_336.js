setcpm(120/4);
$: s("cowbell").gain(0.5);
$: note("c4 d4 d#4 f4").scale("c2:minor").sound("bd").lpf(2543).room(0.5).gain(0.4);
$: s("hh*8").gain(0.15);
