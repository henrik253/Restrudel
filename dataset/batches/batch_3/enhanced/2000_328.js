setcpm(120/4);
$: s("gm_lead_6_voice").lpf(1800).room(0.5).gain(0.4);
$: s("bd*2 ~").gain(0.8);
$: s("hh*8").gain(0.15);
