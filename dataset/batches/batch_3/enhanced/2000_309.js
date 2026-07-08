setcpm(120/4);
$: n("2 3 4 3 2 1 3 0").scale("c:major").s("sawtooth").gain(0.3);
$: note("c3 d3 e3").scale("c2:minor").sound("supersaw").lpf(3000).gain(0.3).release(0.07);
$: s("bd*4 ~ sd ~").gain(0.8);
