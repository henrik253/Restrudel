setcpm(120/4);
$: s("hh*8").lpf(566).gain(0.4);
$: s("bd*2 ~").gain(0.8);
$: s("pad").slow(4).gain(0.3);
