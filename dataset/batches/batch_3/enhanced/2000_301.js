setcpm(120/4);
$: s("sawtooth").lpf(531).resonance(2).gain(0.3);
$: note("c2*4 c5 b4 a#4").scale("c2:minor").sound("drum").lpf(342).gain(0.6);
$: s("hh*8").gain(0.2);
