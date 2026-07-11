setcpm(110/4)
$: s("sd ~ sd:2 bd").bank("RolandTR909").gain(.8)
$: s("woodblock:1 woodblock:2*2").gain(.6).release(.1).attack(.1)
$: note("c5 f5").s("hh").lpf(4283).gain(.3)
