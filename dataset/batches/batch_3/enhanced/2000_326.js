setcpm(120/4);
$: s("supersaw").slow(5.5).gain(0.3);
$: note("e3 g3 c4").scale("c2:minor").sound("kick").lpf(4900).room(0.8).gain(0.3);
$: s("bd*4 ~").gain(0.8);
