Toastify({
  text: 'Username or Password is Incorrect!',
  duration: 3000,
  destination: "",
  newWindow: true,
  close: true,
  gravity: "top", // `top` or `bottom`
  position: "right", // `left`, `center` or `right`
  stopOnFocus: true, // Prevents dismissing of toast on hover
  style: {
    background: "#a55658",
  },
  onClick: function(){} // Callback after click
}).showToast();