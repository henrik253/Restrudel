setcpm(120/4);
$: note("g4 g3").scale("c2:minor").sound("kick").gain(0.5).lpf(1701);
$: s("bd*4").gain(0.8);
$: n("0 2 4 7").scale("g:minor").s("sawtooth").gain(0.3);
