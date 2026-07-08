setcpm(120/4);
$: s("hh*8").hpf(6000).lpf(2771).gain(0.15);
$: n("3 8 9 10").scale("c:major").s("sawtooth").gain(0.3);
$: s("bd*2 ~").gain(0.8);
