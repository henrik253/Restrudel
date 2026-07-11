setcpm(120/4);
$: s("gm_pad_warm").cutoff(442).lpf(2800).room(0.5).gain(0.3);
$: note("d#5 a4").scale("c2:minor").s("sawtooth").gain(0.3);
$: s("bd*2 ~").gain(0.8);
