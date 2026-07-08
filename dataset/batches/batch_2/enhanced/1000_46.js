setcpm(96/4)
$: s("cr bd sd bd").slow(4).gain(.7)
$: s("linndrum_bd ~").bank("RolandMT32").room(.7).delay(.4).delaytime(.125).delayfeedback(.3).gain(.6)
$: note("c4*2 d#4 f4 ~").s("sawtooth").gain(.35).lpf(1500)
