import { User, deleteUserById } from '../../db/schema';
import { deleteStripeCustomer } from '../../utils/stripe/api';

export const deleteUserResource = async (user: User) => {
  // Delete user from database.
  await deleteUserById(user.id);

  // Delete Stripe Customer.
  if (user.customerId) await deleteStripeCustomer(user.customerId);

  // Destroy session.
  // let session = await getSession(request.headers.get('Cookie'));
  // return redirect('/', {
  //   headers: {
  //     'Set-Cookie': await destroySession(session),
  //   },
  // });
};
