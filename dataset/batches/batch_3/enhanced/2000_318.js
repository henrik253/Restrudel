setcpm(120/4);
$: s("bell").gain(0.4);
$: s("hh*8").gain(0.2);
$: s("sawtooth").gain(0.3).lpf(2000);
