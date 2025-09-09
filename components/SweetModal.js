import Swal from 'sweetalert2';

export const showModal = ({ 
  title, 
  text, 
  icon = 'success', 
  confirmButtonText = 'OK',
  timer
}) => {
  return Swal.fire({
    title,
    text,
    icon, // 'success', 'error', 'warning', 'info', 'question'
    confirmButtonText,
    timer,
    confirmButtonColor: '#3B82F6', // blue-600
    customClass: {
      container: 'font-sans',
      popup: 'rounded-lg',
      confirmButton: 'px-4 py-2 rounded-md'
    }
  });
};