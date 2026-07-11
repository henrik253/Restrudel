setcpm(120/4);
$: note("c5 f5").scale("c2:minor").s("lt").slow(2).gain(0.4);
$: note("e3 g3").scale("c2:minor").sound("supersaw").lpf(4000).room(0.5).gain(0.4);
$: s("bd*2 ~").gain(0.8);
