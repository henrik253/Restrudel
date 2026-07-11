setcpm(120/4);
$: note("d5 d#5 d5 a4").scale("c2:minor").s("gm_piccolo").attack(0.001).release(0.1).gain(0.4);
$: note("a3 f3 c4 g3").scale("c2:minor").sound("sawtooth").lpf(2283).gain(0.3);
$: s("bd*2 ~").gain(0.8);
