setcpm(120/4)

$: s("gm_drawbar_organ ocarina_vib").vib(4).vibmod(.2113).hpf(50).gain("[0.8 0.4]*4").room(.4)

$: s("gm_electric_bass_finger ~").velocity(.3).pan(.55)

$: s("rd 1!3").slow(2)
